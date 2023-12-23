export const getUsernameInitial = (name: string) => {
  const escapedName = name;
  const parts = escapedName.split(" ") || [];
  const firstName = parts.shift() || "";
  const lastName = parts.pop() || "";
  const firstInitial = firstName.length > 0 ? firstName[0] : "";
  const lastInitial = lastName.length > 0 ? lastName[0] : "";
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();
  return initials;
};
