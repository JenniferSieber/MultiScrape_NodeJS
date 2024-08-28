// Read the categories.json, create a file for each category with books data saved 
// to json file based on category name. (shortened long list for testing)
import fs from 'fs';
import puppeteer from 'puppeteer';

fs.readFile('categoriesList.json', 'utf8', (err, data) => {
  if (err) {
      console.error(err);
      return;
  }

  const catalog = JSON.parse(data);
  const arrayOfArrays = catalog.map(item => [item.title, item.link]);
  arrayOfArrays.forEach(arr => {
    const categoryTitle = arr[0].split(' ').join('_');
    const url = arr[1];
    scrapeCategory(categoryTitle, url);
  })
});

const convertURL = (relativePath, baseURL) => {
  const fullURL = new URL(relativePath, baseURL).href;
  return fullURL;
};

const convertAlphaNumeric = (ratingText) => {
  const ratingMap = {
    'One': 1,
    'Two': 2,
    'Three': 3,
    'Four': 4,
    'Five': 5,
  };
  return`${ratingMap[ratingText] || 0}`;
};

const scrapeCategory = async (categoryTitle, url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const books = await page.evaluate(() => {
    const bookElements = document.querySelectorAll('.product_pod');

    return Array.from(bookElements).map((book) => {

      const bookTitle = book.querySelector('h3 a').getAttribute('title');
      const availability = book.querySelector('.instock.availability') ? 'In Stock' : 'Out of Stock';
      const price = book.querySelector('.price_color').textContent;
      const rating = book.querySelector('.star-rating').className.split(' ')[1];
      const imgSrc = book.querySelector('.image_container img').getAttribute('src');
      const link = book.querySelector('h3 a').getAttribute('href');
      
      return {
        bookTitle,
        availability,
        price,
        rating,
        imgSrc,
        link
      };
    });
  });

  const booksWithConvertedURLs = books.map(book => ({
    ...book,
    convertedRating: convertAlphaNumeric(book.rating),
    convertedImgSrc: convertURL(book.imgSrc, 'https://books.toscrape.com/'),
    convertedLink: convertURL(book.link, 'https://books.toscrape.com/catalogue/')
  }));

  const booksForJsonOutput = booksWithConvertedURLs.map(book => {
    const { rating, imgSrc, link, ...rest} = book;
    return rest;
  });
  
  console.log(`Category:  ${categoryTitle}, ${books.length} Books:  `, booksForJsonOutput);
  fs.writeFileSync(`${categoryTitle}.json`, JSON.stringify(booksForJsonOutput, null, 2));
  console.log(`File: ${categoryTitle}.json created.`);
  await browser.close();
}
