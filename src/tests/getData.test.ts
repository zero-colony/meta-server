import { getData } from "../services/LandsService";

(async () => {
  for (let i = 1; i <= 21000; i++) {
    const data = await getData(i);
    if (data?.[0]?.trait_type) {
      process.stdout.write("_");
    } else {
      process.stdout.write("|||" + i + "|||");
    }
  }
})();
