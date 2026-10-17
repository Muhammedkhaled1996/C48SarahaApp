// db.repository.js

/**
 * دالة مساعدة لتجهيز عمليات التعديل ودعم __v و Pipelines
 */
const formatUpdatePayload = (data) => {
  if (Array.isArray(data)) {
    return [...data, { $set: { __v: { $add: [{ $ifNull: ["$__v", 0] }, 1] } } }];
  }
  return { ...data, $inc: { __v: 1 } };
};

/**
 * إنشاء مستند أو عدة مستندات دفعة واحدة
 */
export const create = async ({ model, data = [], options = {}, lean = false } = {}) => {
  const payload = Array.isArray(data) ? data : [data];
  const docs = await model.create(payload, { validateBeforeSave: true, ...options });
  if (lean) {
    return docs.map((doc) => doc.toObject({ virtuals: false }));
  }
  return docs;
};

/**
 * إنشاء مستند واحد فقط وإرجاعه مباشرة كـ Object
 */
export const createOne = async ({ model, data = {}, options = {}, lean = false } = {}) => {
  const [doc] = await model.create([data], { validateBeforeSave: true, ...options });
  if (!doc) return null;
  return lean ? doc.toObject({ virtuals: false }) : doc;
};

/**
 * جلب مستند واحد بناءً على شرط (filter)
 */
export const findOne = async ({ model, filter = {}, select = "", populate = [], lean = false, options = {} } = {}) => {
  const doc = model.findOne(filter, select, options).populate(populate);
  if (lean) doc.lean();
  return await doc.exec();
};

/**
 * جلب مستند عبر الـ ID
 */
export const findById = async ({ model, id, select = "", populate = [], lean = false, options = {} } = {}) => {
  const doc = model.findById(id, select, options).populate(populate);
  if (lean) doc.lean();
  return await doc.exec();
};

/**
 * جلب قائمة مستندات مع إمكانية الترتيب والفلترة والـ populate
 */
export const find = async ({
  model,
  filter = {},
  select = "",
  populate = [],
  sort = {},
  skip = 0,
  limit = 0,
  lean = false,
  options = {},
} = {}) => {
  const doc = model.find(filter, select, options).sort(sort).skip(skip).limit(limit).populate(populate);

  if (lean) doc.lean();
  return await doc.exec();
};

/**
 * جلب المستندات بنظام الصفحات (Pagination) مع إحصائيات الصفحة ودعم جلب الكل
 */
export const paginate = async ({
  model,
  filter = {},
  select = "",
  populate = [],
  sort = { createdAt: -1 },
  page = 1,
  limit = 5,
  lean = true,
  options = {},
} = {}) => {
  // دعم جلب كامل البيانات بدون تصفح عند تمرير page: "all"
  if (page === "all") {
    const docs = await find({
      model,
      filter,
      select,
      populate,
      sort,
      lean,
      options,
    });
    return {
      count: docs.length,
      pagination: {
        page: 1,
        limit: docs.length,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false,
      },
      docs,
    };
  }

  // 1. حماية من قيم NaN والقيم غير الصالحة
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  // 2. بناء استعلام البحث
  const doc = model.find(filter, select, options).sort(sort).skip(skip).limit(parsedLimit).populate(populate);

  if (lean) {
    doc.lean();
  }

  // 3. التنفيذ المتوازي للبحث وحساب العدد الكلي
  const [docs, totalDocs] = await Promise.all([doc.exec(), model.countDocuments(filter)]);

  // 4. الحساب الدقيق للصفحات
  const totalPages = totalDocs === 0 ? 0 : Math.ceil(totalDocs / parsedLimit);

  return {
    totalDocs,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      hasPrevPage: parsedPage > 1,
      hasNextPage: parsedPage < totalPages,
    },
    docs,
  };
};

/**
 * تعديل أول مستند يطابق الشرط (يرجع نتيجة المعالجة الفنية)
 */
export const updateOne = async ({ model, filter = {}, data = {}, options = { runValidators: true } } = {}) => {
  const updatePayload = formatUpdatePayload(data);
  return await model.updateOne(filter, updatePayload, options);
};

/**
 * تعديل مستند عبر الـ ID وإرجاع القيمة الجديدة
 */
export const findByIdAndUpdate = async ({
  model,
  id,
  data = {},
  options = { returnDocument: "after", runValidators: true },
} = {}) => {
  const updatePayload = formatUpdatePayload(data);
  return await model.findByIdAndUpdate(id, updatePayload, options);
};

/**
 * تعديل مستند واحد يطابق الشرط وإرجاع القيمة الجديدة
 */
export const findOneAndUpdate = async ({
  model,
  filter = {},
  data = {},
  options = { returnDocument: "after", runValidators: true },
} = {}) => {
  const updatePayload = formatUpdatePayload(data);
  return await model.findOneAndUpdate(filter, updatePayload, options);
};

/**
 * تعديل كافة المستندات المطابقة للشرط
 */
export const updateMany = async ({ model, filter = {}, data = {}, options = { runValidators: true } } = {}) => {
  const updatePayload = formatUpdatePayload(data);
  return await model.updateMany(filter, updatePayload, options);
};

/**
 * حذف مستند عبر الـ ID وإرجاعه
 */
export const findByIdAndDelete = async ({ model, id, options = {} } = {}) => {
  return await model.findByIdAndDelete(id, options);
};

/**
 * حذف أول مستند يطابق الشرط وإرجاعه
 */
export const findOneAndDelete = async ({ model, filter = {}, options = {} } = {}) => {
  return await model.findOneAndDelete(filter, options);
};

/**
 * حذف مستند واحد (لا يرجع المستند، يرجع نتيجة الحذف فقط)
 */
export const deleteOne = async ({ model, filter = {}, options = {} } = {}) => {
  return await model.deleteOne(filter, options);
};

/**
 * حذف جميع المستندات المطابقة للشرط
 */
export const deleteMany = async ({ model, filter = {}, options = {} } = {}) => {
  return await model.deleteMany(filter, options);
};

/**
 * حساب عدد المستندات المطابقة للشرط
 */
export const countDocuments = async ({ model, filter = {}, options = {} } = {}) => {
  return await model.countDocuments(filter, options);
};

/**
 * التحقق من وجود مستند يطابق الشرط
 */
export const exists = async ({ model, filter = {} } = {}) => {
  return await model.exists(filter);
};

/**
 * تنفيذ Aggregation Pipeline
 */
export const aggregate = async ({ model, pipeline = [], options = {} } = {}) => {
  return await model.aggregate(pipeline).option(options);
};
