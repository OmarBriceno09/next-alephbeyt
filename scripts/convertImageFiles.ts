import fs from "fs";
import path from "path";
import sharp from "sharp";

async function main() {
    const inputDir = "O:/Projects/LearningInspired/00 The 7 Moedim/Alphabet Illustrations";
    const outputDir = "D:/LearningInspired/Assets/AlphabetIllustrations";

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const files = fs.readdirSync(inputDir);
    
    for (const file of files) {
        if (path.extname(file) === ".svg") {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(
            outputDir,
            path.basename(file, ".svg") + ".webp"
        );

        await sharp(inputPath, {density:100})
            .webp({ quality: 90 })
            .toFile(outputPath);

        console.log(`Converted: ${file}`);
        }
    }
}

main();

//run with npx tsx .\scripts\convertImageFiles.ts