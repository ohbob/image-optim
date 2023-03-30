require('dotenv').config();
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const staticFolder = './input'
const optimizedFolder = './output'
const formats = process.env.FORMATS.split(", ");
const sizes = createKeyPair(process.env.SIZES.split(", "))

function createKeyPair(arr) {
    const obj = {};
    for (var i = 0; i < arr.length; i += 2) {
        obj[arr[i]] = Number(arr[i + 1]);
    }
    return obj;
}



function optimize(sizes, formats, staticFolder, optimizedFolder) {
    if (!fs.existsSync(staticFolder)) fs.mkdirSync(staticFolder);
    if (!fs.existsSync(optimizedFolder)) fs.mkdirSync(optimizedFolder);

    fs.readdir(staticFolder, async (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        const images = files.filter(file => file.match(/\.(jpeg|jpg|png)$/));

        const tasks = images.map(image => {
            const imagePath = `${staticFolder}/${image}`;
            const fileName = path.parse(image).name;

            return Promise.all(
                formats.map(format =>
                    Promise.all(
                        Object.keys(sizes).map(name => {
                            const currentFile = `${optimizedFolder}/${name}_${fileName}.${format}`;
                            if (!fs.existsSync(currentFile)) {
                                const width = sizes[name];
                                return sharp(imagePath)
                                    .resize({ width })
                                    .toFormat(format)
                                    .toFile(currentFile)
                                    .then(() => console.log(`Optimized ${name}_${fileName}.${format}`))
                                    .catch(error => console.error(error));
                            }
                        })
                    )
                )
            );
        });

        async () => {
            // Run all the tasks concurrently
            await Promise.all(tasks);
        }
    });
}

optimize(sizes, formats, staticFolder, optimizedFolder)


