// Scrape Main page to return book elements - up to 50 pages of data
import fs from 'fs';
import puppeteer from 'puppeteer';

const convertURL = (relativePath, baseURL) => {
  const fullURL = new URL(relativePath, baseURL).href;
  return fullURL;
}

const scrape = async (url, maxPages) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const allBooks = [];
  let currentPage = 1;

  while (currentPage <= maxPages) {
    await page.goto(url);

    const books = await page.evaluate(() => {
      const bookElements = document.querySelectorAll('.product_pod');
      return Array.from(bookElements).map((book) => {
        const bookTitle = book.querySelector('h3 a').getAttribute('title');
        const rating = book.querySelector('.star-rating').className.split(' ')[1];
        const price = book.querySelector('.price_color').textContent;
        const availability = book.querySelector('.instock.availability') ? 'In Stock' : 'Out of Stock';
        const link = book.querySelector('h3 a').getAttribute('href');
        return {
          bookTitle,
          rating,
          price,
          availability,
          link
        };
      });
    });

    allBooks.push(...books);
      console.log(`Books on page: ${currentPage}: `);
      currentPage++;
    };

    // Convert the relative paths to absolute URLs
    const booksWithConvertedURLs = allBooks.map(book => ({
      ...book,
      convertedLink: convertURL(book.link, 'https://books.toscrape.com/')
    }));

  fs.writeFileSync('books.json', JSON.stringify(booksWithConvertedURLs, null, 2));
  console.log('Data saved: books.json');
  
  await browser.close();
};

// pass main url and number of pages to pull
scrape('https://books.toscrape.com', 5);