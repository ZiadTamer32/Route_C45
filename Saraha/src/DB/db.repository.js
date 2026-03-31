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
export async function updateOne({ model, filters, bodyData, options = {} }) {
  const result = await model.updateOne(filters, bodyData, options);
  return result;
}

export async function deleteOne({ model, filters, bodyData }) {
  const result = await model.deleteOne(filters, bodyData);
  return result;
}

export async function findByIdAndUpdate({
  model,
  id,
  bodyData,
  options = { new: true },
}) {
  const result = await model.findByIdAndUpdate(id, bodyData, options);
  return result;
}

export async function findByIdAndDelete({ model, id }) {
  const result = await model.findByIdAndDelete(id);
  return result;
}

export async function updateMany({ model, filters, bodyData, options = {} }) {
  const result = await model.updateMany(filters, bodyData, options);
  return result;
}

export async function deleteMany({ model, filters }) {
  const result = await model.deleteMany(filters);
  return result;
}

export async function insertMany({ model, data, options = {} }) {
  const result = await model.insertMany(data, options);
  return result;
}

export async function countDocuments({ model, filters = {} }) {
  const result = await model.countDocuments(filters);
  return result;
}

export async function aggregate({ model, pipeline = [] }) {
  const result = await model.aggregate(pipeline);
  return result;
}
