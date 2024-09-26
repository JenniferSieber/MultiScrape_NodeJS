// Scrape the Categories on the Side NavList for title and link - categoriesList.json
import fs from 'fs';
import puppeteer from 'puppeteer';


const scrape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const url = `https://books.toscrape.com/catalogue/category/books_1/index.html`;
  await page.goto(url);
  const catalog = await page.evaluate(() => {
    const asideElements = document.querySelectorAll('.nav-list li ul li');
    return Array.from(asideElements).map((element) => {
      const title = element.querySelector('a').textContent.trim();
      const link = element.querySelector('a')['href'];
      return {
        title,
        link,
      };
    });
  });
  
  fs.writeFileSync('categoriesList.json', JSON.stringify(catalog, null, 2));
  console.log('Data saved to categoriesList.json');
  await browser.close();
};

scrape();


