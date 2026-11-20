import {test, expect} from '@playwright/test';

async function local(page) {
  // Test locali: nessuna richiesta ai provider o al database di produzione.
  await page.route('**/config.js', route => route.fulfill({contentType:'text/javascript', body:'export default {};'}));
  await page.goto('/');
  await page.getByRole('button', {name:'Continua senza account'}).click();
}

for (const path of ['/', '/shopping.html']) {
  test(`salto al contenuto, lingua, titolo e nomi dialoghi: ${path}`, async ({page}) => {
    await local(page);
    await page.goto(path);
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', {name:'Vai al contenuto principale'});
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    await expect(page.locator('html')).toHaveAttribute('lang','it');
    await expect(page).toHaveTitle(path === '/' ? /OrganAIzer/ : /Spesa · OrganAIzer/);
    expect(await page.locator('dialog').evaluateAll(dialogs => dialogs.every(dialog => {
      const heading = document.getElementById(dialog.getAttribute('aria-labelledby'));
      return heading && dialog.contains(heading);
    }))).toBe(true);
  });
}

test('editor: tastiera, focus confinato, Escape e ritorno al comando', async ({page}) => {
  await local(page);
  const add = page.getByRole('button', {name:'Aggiungi un impegno', exact:true});
  await add.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', {name:'Facciamogli spazio.'});
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  for (let index=0; index<20; index++) {
    // Chromium passa dal body al confine del ciclo; nessun controllo sullo
    // sfondo deve ricevere focus mentre il dialogo nativo è modale.
    expect(await dialog.evaluate(node => node.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
    await page.keyboard.press('Tab');
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(add).toBeFocused();
  await page.keyboard.press('Space');
  await expect(dialog).toBeVisible();
});

test('creazione attività locale e persistenza dopo ricarica', async ({page}) => {
  await local(page);
  await page.getByRole('button', {name:'Aggiungi un impegno', exact:true}).click();
  await page.getByLabel('Titolo', {exact:true}).fill('Controllo browser');
  await page.getByRole('button', {name:'Salva nel vostro spazio'}).click();
  await expect(page.locator('#editor-dialog')).not.toBeVisible();
  await page.reload();
  await page.getByRole('button', {name:/Attività e turni/}).click();
  await expect(page.getByRole('heading', {name:'Controllo browser'})).toBeVisible();
});

test('lista locale, quantità, stato acquistato e persistenza', async ({page}) => {
  await local(page);
  await page.goto('/shopping.html');
  await page.getByLabel('Nome della lista').fill('Spesa browser');
  await page.getByRole('button', {name:'Crea la lista'}).click();
  await page.getByRole('textbox', {name:'Prodotto', exact:true}).fill('Latte');
  await page.getByRole('button', {name:'Aggiungi prodotto', exact:true}).click();
  await page.getByRole('button', {name:'Aumenta quantità di Latte'}).click();
  await expect(page.getByRole('spinbutton', {name:'Quantità di Latte'})).toHaveValue('2');
  await page.getByRole('button', {name:'Segna acquistato: Latte'}).click();
  await expect(page.getByRole('button', {name:'Da acquistare: Latte'})).toHaveAttribute('aria-pressed','true');
  await page.reload();
  await expect(page.getByRole('heading', {name:'Spesa browser'})).toBeVisible();
  await expect(page.getByRole('button', {name:'Da acquistare: Latte'})).toHaveAttribute('aria-pressed','true');
});

test('focus visibile, movimento ridotto e comandi touch', async ({page}, testInfo) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await local(page);
  const add = page.getByRole('button', {name:'Aggiungi un impegno', exact:true});
  await page.keyboard.press('Tab');
  await add.focus();
  const outline = await add.evaluate(node => getComputedStyle(node).outlineStyle);
  expect(outline).not.toBe('none');
  await add.click();
  const close = page.locator('#editor-dialog .close-dialog');
  expect(await close.evaluate(node => parseFloat(getComputedStyle(node).transitionDuration))).toBeLessThanOrEqual(.01);
  if (testInfo.project.name === 'mobile') {
    const box = await close.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
