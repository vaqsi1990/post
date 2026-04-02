/** ადმინის ამანათების სიისთვის — კლიენტი + ვინ ატვირთა (თანამშრომელი/ადმინი) */
export const adminParcelInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      city: true,
      address: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      employeeCountry: true,
    },
  },
} as const;
