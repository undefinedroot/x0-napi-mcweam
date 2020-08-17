const advancedResults =
  (model, populate) =>
    async (req, res, next) => {
      let query;

      // copy req.query
      const reqQuery = { ...req.query };

      // fields to exclude on filtering (these are the keywords that should not appear as value of fields in a query)
      const removeFields = ['select', 'sort', 'page', 'limit'];

      // loop  over removeFields and delete them from reqQuery
      removeFields.forEach(param => delete reqQuery[param]);

      // create query string
      let queryStr = JSON.stringify(reqQuery); /* make the query as a string so that we can manipulate it */

      // retrieve all operators via regular expression, and then append '$' prefix to use advanced filtering
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

      // find resource
      query = model.find(JSON.parse(queryStr));

      // select fields, so that we only want to retrieve specific fields
      if (req.query.select) {
        // make value of query from 'select' property into space separated string for mongodb
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields); /* this function is from mongoose */
      }

      // sort
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy); /* this function is from mongoose */
      } else { /* default by date */
        query = query.sort('-createdAt');
      }

      // pagination
      const page = parseInt(req.query.page, 10) || 1; /* base 10 parse, default 'page' as 1 */
      const limit = parseInt(req.query.limit, 10) || 25;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const total = await model.countDocuments();

      query = query.skip(startIndex).limit(limit);

      //populate using either a virtual property or an object relationship
      if (populate) {
        query = query.populate(populate);
      }

      // execute query
      const results = await query;

      // Pagination result
      const pagination = {};

      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit
        };
      }

      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit
        }
      }

      // make a property that others will use
      res.ar_prop = {
        success: true,
        count: results.length,
        pagination,
        data: results
      };

      next();
    }

module.exports = advancedResults;