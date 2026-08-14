export function getConfirmationFirstName(search: string) {
  const params = new URLSearchParams(search);
  return (params.get('firstName') ?? params.get('prenom') ?? '').trim();
}

export function formatConfirmationFirstName(firstName: string) {
  const trimmed = firstName.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : '';
}
