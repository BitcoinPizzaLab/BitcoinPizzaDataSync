const Jimp = require('jimp');
const fs = require("fs");

const watermarkImagePath = './assets/watermark.png';
const sourceFolderPath = './pizza';
const outputFolderPath = './assets/output';

const watermarkOpacity = 0.3;

// 加载水印图片
Jimp.read(watermarkImagePath, (err, watermarkImage) => {
  if (err) throw err;

  // 读取源文件夹中的所有图片
  fs.readdir(sourceFolderPath, (err, files) => {
    if (err) throw err;

    // 遍历每张图片并添加水印
    files.forEach(file => {
      const sourceImagePath = `${sourceFolderPath}/${file}`;

      // 加载源图片
      Jimp.read(sourceImagePath, (err, sourceImage) => {
        if (err) throw err;

        // 调整水印大小
        const watermarkWidth = sourceImage.bitmap.width * 0.8;
        const watermarkHeight = watermarkImage.bitmap.height * (watermarkWidth / watermarkImage.bitmap.width);
        watermarkImage.resize(watermarkWidth, watermarkHeight);

        // 将水印添加到源图片上
        sourceImage.composite(watermarkImage, 130, 130, {
          mode: Jimp.BLEND_SOURCE_OVER,
          opacitySource: watermarkOpacity
        });

        // 保存带有水印的图片
        const outputImagePath = `${outputFolderPath}/${file}`;
        sourceImage.write(outputImagePath);
      });
    });
  });
});
