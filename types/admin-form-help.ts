export type AdminFormHelpField = {
  name: string;
  detail: string;
};

export type AdminFormHelpSection = {
  title: string;
  intro: string;
  fields: AdminFormHelpField[];
};
