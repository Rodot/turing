export const cleanAnswer = (str: string) => {
  let prev = "";
  let current = str;

  // Keep applying transformations until no more changes occur
  while (prev !== current) {
    prev = current;
    // Convert to lowercase
    current = current.toLowerCase();
    // Remove all single quotes
    current = current.replace(/'/g, "");
    // Remove all double quotes
    current = current.replace(/"/g, "");
    // Remove all backticks
    current = current.replace(/`/g, "");
    // Remove all periods
    current = current.replace(/\./g, "");
    // Remove em dashes
    current = current.replace(/—/g, "");
    // Remove all commas
    current = current.replace(/,/g, "");
    // Replace multiple spaces with single space
    current = current.replace(/\s+/g, " ");
    // Trim again after space normalization
    current = current.trim();
  }

  return current;
};
