import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

   // Navigate to page
    const url = 'https://www....';
    
    await page.goto(url, { waitUntil: 'networkidle' });

   // Create output folders
    await mkdir('output', { recursive: true });
    await mkdir('output/css', { recursive: true });
    await mkdir('output/js', { recursive: true });

    // Extract HTML and save
    const html = await page.content();
    await writeFile('output/index.html', html);
    
    console.log("HTML page saved.");

    // Filter CSS and JS from the same domain
    const domain = new URL(url).origin;

    const cssLinks = await page.$$eval('link[rel="stylesheet"]', links =>
        links.map(link => link.href).filter(href => href.startsWith(domain))
    );

    const scriptLinks = await page.$$eval('script[src]', scripts =>
        scripts.map(script => script.src).filter(src => src.startsWith(domain))
    );

    // Download and save CSS
    await Promise.all(cssLinks.map(async (link) => {
        try {
            const response = await page.request.get(link);
            if (response.ok()) {
                const cssContent = await response.text();
                const fileName = path.basename(new URL(link).pathname);
                await writeFile(`output/css/${fileName}`, cssContent);
                console.log(`CSS saved: ${fileName}`);
            }
        } catch (error) {
            console.error(`Error downloading CSS: ${link}`, error);
        }
    }));

    // Download and save JavaScript
    await Promise.all(scriptLinks.map(async (link) => {
        try {
            const response = await page.request.get(link);
            if (response.ok()) {
                const jsContent = await response.text();
                const fileName = path.basename(new URL(link).pathname);
                await writeFile(`output/js/${fileName}`, jsContent);
                console.log(`JS saved: ${fileName}`);
            }
        } catch (error) {
            console.error(`Error downloading JS: ${link}`, error);
        }
    }));

    console.log("Full download.");
    await browser.close();
})();
