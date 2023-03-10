const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
const truncateEthAddress = (address: string, half?: "first" | "second") => {
  if (address) {
    const match = address.match(truncateRegex);
    if (!match) return address;
    if (half === "first") return `${match[1]}...`;
    if (half === "second") return match[2];
    return `${match[1]}…${match[2]}`;
  }
};

export { truncateEthAddress };
