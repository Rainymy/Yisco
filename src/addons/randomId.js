module.exports = function randomId(id="default", options={ space:"_", previous_value:"" }) {
  let spacing = options;
  if (typeof options === "object") {
    if (!options.space) { spacing = "_"; }
    else { spacing = options.space; }
  }
  if (options.previous_value && typeof options.previous_value === "number" ) {
    return id + spacing + (options.previous_value + 1);
  }
  return id + spacing + Math.random().toString(36).substring(2);
}