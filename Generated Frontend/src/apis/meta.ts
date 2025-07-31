export const fetchMetaData = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Error fetching metadata: ${response.statusText}`);
  }

  return response.json();
};

export const fetchForeignData = async (
  resource: string,
  fieldName: string,
  foreignField: string
) => {
  // You can customize the URL based on your backend
  const response = await fetch(`/api/foreign/${resource}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch foreign data for ${resource}`);
  }

  return response.json();
};

export const fetchEnumData = async (enumName: string) => {
  const response = await fetch(`/api/enum/${enumName}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch enum data for ${enumName}`);
  }

  return response.json();
};
