const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

class ConverterService {
  /**
   * Main Function
   */
  convert({
    masterFile,
    fleetFile,
    outputFile,
    vehicleField = "vehicleNumber",
  }) {
    const master = this.readMaster(masterFile);
    const fleet = this.readFleet(fleetFile);

    const masterMap = this.buildMasterMap(master);

    const rows = this.convertRows({
      fleet,
      masterMap,
      vehicleField,
    });

    this.exportCsv(rows, outputFile);

    return {
      total: rows.length,
      outputFile,
    };
  }

  /**
   * Read Master Excel
   */
  readMaster(filePath) {
    const workbook = XLSX.readFile(filePath);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });
  }

  /**
   * Read Fleet Excel
   */
  readFleet(filePath) {
    const workbook = XLSX.readFile(filePath);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });
  }

  /**
   * Create CardNumber Lookup Map
   */
  buildMasterMap(master) {
    const map = new Map();

    master.forEach((row) => {
      const cardNumber = String(row.CardNumber || "").trim();

      if (!cardNumber) return;

      map.set(cardNumber, {
        vehicleNumber: row.VehicleNumber,
        vehicleCode: row.VehicleCode,
      });
    });

    return map;
  }

  /**
   * Convert Fleet Rows
   */
  convertRows({ fleet, masterMap, vehicleField }) {
    const output = [];

    // Skip Header
    for (let i = 1; i < fleet.length; i++) {
      const row = fleet[i];

      if (!row || row.length === 0) continue;

      // ===== Fleet Mapping =====
      const date = row[5]; // F
      const time = row[6]; // G
      const cardNumber = String(row[7] || "").trim(); // H (ปรับตามจริง)
      const columnAA = row[26]; // AA

      const master = masterMap.get(cardNumber);

      if (!master) continue;

      output.push([
        `${date} ${time}`,
        vehicleField === "VehicleCode"
          ? master.vehicleCode
          : master.vehicleNumber,
        1,
        11,
        columnAA,
      ]);
    }

    return output;
  }

  /**
   * Export CSV
   */
  exportCsv(rows, outputFile) {
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    fs.mkdirSync(path.dirname(outputFile), {
      recursive: true,
    });

    fs.writeFileSync(outputFile, csv, "utf8");
  }
}

module.exports = new ConverterService();
