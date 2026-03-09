export async function findOne({
  model,
  filters = {},
  select = "",
  sort = {},
  populateField = null,
}) {
  let query = model.findOne(filters).sort(sort).select(select);
  if (populateField) {
    query = query.populate(populateField);
  }
  return await query;
}
export async function findById({
  model,
  id,
  select = "",
  sort = {},
  populateField = null,
}) {
  let query = model.findById(id).sort(sort).select(select);
  if (populateField) {
    query = query.populate(populateField);
  }
  return await query;
}

export async function create({ model, bodyData, options = {} }) {
  const [result] = await model.create([bodyData], options);
  return result;
}
