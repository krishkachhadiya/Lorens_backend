const buildTree = (categories, parentId = null) => {
  return categories
    .filter((cat) => {
      const catParent = cat.parent ? cat.parent.toString() : null;
      const targetParent = parentId ? parentId.toString() : null;
      return catParent === targetParent;
    })
    .map((cat) => ({
      ...(cat.toObject ? cat.toObject() : cat),
      children: buildTree(categories, cat._id)
    }));
};

module.exports = { buildTree };
