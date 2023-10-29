export const getInitials = (name: string) => {
  var initials = name.replace(/[^a-zA-Z- ]/g, '').match(/\b\w/g);
  return initials?.join('');
};
