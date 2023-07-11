import { register } from "@public-ui/components";
import { defineCustomElements } from "@public-ui/components/dist/loader";
import { BMF } from "@public-ui/themes";

register(BMF, defineCustomElements).then(() => {
  if (Blazor) {
    Blazor.start();
  } else {
    console.warn("Unable to start Blazor. Is it not initialized?");
  }
});
