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

    return res.download(result.outputFile, fileName);
  } catch (err) {
    next(err);
  }
};
