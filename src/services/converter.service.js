const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const FLEET_COLUMNS = {
  DATE: 5, // F
  TIME: 6, // G
  VEHICLE_NUMBER: 7, // H
  CARD_NUMBER: 8, // I
  AMOUNT: 26, // AA
};

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

    const { rows, missingCards } = this.convertRows({
      fleet,
      masterMap,
      vehicleField,
    });

    this.exportCsv(rows, outputFile);

    return {
      totalRows: fleet.length - 1,
      convertedRows: rows.length,
      missingRows: missingCards.length,
      missingCards,
      outputFile,
      fileName: path.basename(outputFile),
    };
  }

  /**
   * Read Master Excel (.xlsx)
   */
  readMaster(filePath) {
    const workbook = XLSX.readFile(filePath);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });
  }

  /**
   * Read Fleet Excel (.xlsx)
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
   * Build Master Lookup
   *
   * Key = CardNumber
   * Value = VehicleNumber + VehicleCode
   */
  buildMasterMap(master) {
    const map = new Map();

    for (const row of master) {
      const cardNumber = String(row.CardNumber || "").trim();

      if (!cardNumber) continue;

      if (map.has(cardNumber)) {
        throw new Error(`Duplicate CardNumber: ${cardNumber}`);
      }

      map.set(cardNumber, {
        vehicleNumber: String(row.VehicleNumber || "").trim(),
        vehicleCode: String(row.VehicleCode || "").trim(),
      });
    }

    return map;
  }

  /**
   * Convert Fleet -> CSV
   */
  convertRows({ fleet, masterMap, vehicleField }) {
    try {
      const rows = [];
      const missingCards = [];

      // Skip Header
      for (let i = 1; i < fleet.length; i++) {
        const row = fleet[i];

        if (!row || row.length === 0) continue;

        const date = row[FLEET_COLUMNS.DATE];
        const time = row[FLEET_COLUMNS.TIME];
        const cardNumber = String(row[FLEET_COLUMNS.CARD_NUMBER] || "").trim();
        const amount = Math.floor(row[FLEET_COLUMNS.AMOUNT] * 100) || 0;

        // Skip invalid row
        if (!date || !time || !cardNumber) continue;

        const master = masterMap.get(cardNumber);

        if (!master) {
          missingCards.push({
            row: i + 1,
            cardNumber,
          });

          continue;
        }

        rows.push([
          `${date} ${time}`,
          vehicleField === "vehicleCode"
            ? master.vehicleCode
            : master.vehicleNumber,
          1,
          11,
          amount,
        ]);
      }

      return {
        rows,
        missingCards,
      };
    } catch (e) {
      console.error("Error in convertRows:", e);
    }
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
