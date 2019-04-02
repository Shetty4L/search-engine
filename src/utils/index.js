exports.isValidQuery = q => {
  return (q!==null && q!==undefined && q.length>0);
};

exports.sanitizeSearchQuery = q => {
  return q.toLowerCase();
};
