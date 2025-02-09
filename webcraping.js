
import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

// Navigate to page
    await page.goto('https://www....', { waitUntil: 'networkidle' });

    // Extract the complete HTML
    const html = await page.content();

    // Extract all style sheets (CSS)
    const cssLinks = await page.$$eval('link[rel="stylesheet"]', links => links.map(link => link.href));
    let cssFiles = "";
    for (const link of cssLinks) {
        try {
            const response = await page.request.get(link);
            if (response.ok()) {
                cssFiles += `/* ${link} */\n${await response.text()}\n\n`;
            }
        } catch (error) {
            console.error(`Error downloading CSS: ${link}`, error);
        }
    }

    // Extract all scripts (JavaScript)
    const scriptLinks = await page.$$eval('script[src]', scripts => scripts.map(script => script.src));
    let jsFiles = "";
    for (const link of scriptLinks) {
        try {
            const response = await page.request.get(link);
            if (response.ok()) {
                jsFiles += `/* ${link} */\n${await response.text()}\n\n`;
            }
        } catch (error) {
            console.error(`Error downloading JS: ${link}`, error);
        }
    }

    // Save files locally
    await writeFile('page.html', html);
    await writeFile('styles.css', cssFiles);
    await writeFile('scripts.js', jsFiles);

    console.log("Page extracted successfully.");
    await browser.close();
})();
