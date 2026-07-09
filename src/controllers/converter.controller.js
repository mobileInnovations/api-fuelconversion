const fs = require("fs");
const path = require("path");
const converterService = require("../services/converter.service");

exports.convert = async (req, res, next) => {
  try {
    const vehicleField = req.body.vehicleField || "vehicleNumber";

    const fileName = `${vehicleField}_output_${Date.now()}.csv`;
    const outputFile = path.join("uploads", fileName);

    const result = converterService.convert({
      masterFile: req.files.master[0].path,
      fleetFile: req.files.fleet[0].path,
      outputFile,
      vehicleField,
    });

    res.download(result.outputFile, fileName, (err) => {
      // Remove generated CSV after download
      fs.unlink(result.outputFile, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Failed to delete file:", unlinkErr);
        }
      });

      if (err) {
        return next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};
