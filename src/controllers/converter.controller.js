const converterService = require("../services/converter.service");

exports.convert = async (req, res, next) => {
  console.log("req.files", req.files);
  console.log("req.body", req.body);
  try {
    const result = converterService.convert({
      masterFile: req.files.master[0].path,
      fleetFile: req.files.fleet[0].path,
      outputFile: "./uploads/result.csv",
      vehicleField: req.body.vehicleField,
    });

    return res.download(result.outputFile);
  } catch (err) {
    next(err);
  }
};
