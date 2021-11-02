var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const app = express();
const createError = require('http-errors');
const Sequelize = require('sequelize');
const op = Sequelize.Op;

// Handle async try and catch
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  };
}

/* GET home page. */
router.get('/', (req, res, next) => {
  res.redirect('/books');
});

router.get(
  '/books',
  asyncHandler(async (req, res) => {
    const { count, rows } = await Book.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
    });
    const pages = Math.ceil(count / 5);
    console.log(pages);
    res.render('books/index', {
      books: rows,
      title: 'Books',
      pages,
      activePage: 1,
    });
  })
);

router.get(
  '/books/page/:id',
  asyncHandler(async (req, res) => {
    const limit = 5;
    const offset = req.params.id > 1 ? (req.params.id - 1) * limit : 0;
    const activePage = req.params.id;
    const { count, rows } = await Book.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    const pages = Math.ceil(count / 5);
    console.log(activePage);
    res.render('books/index', {
      books: rows,
      title: 'Books',
      pages,
      activePage,
    });
  })
);

// new book route
router.get('/books/new', (req, res) => {
  res.render('books/new-book', {
    book: {},
    title: 'New Book',
  });
});

//POST create Book
router.post(
  '/books/new',
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect('/books/');
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        book = await Book.build(req.body);
        res.render('books/update-book', {
          book,
          errors: error.errors,
          title: 'Create Book',
        });
      } else {
        throw error;
      }
    }
  })
);

router.get(
  '/books/:id',
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      res.render('books/update-book', { book, title: 'Update Book' });
    } else {
      next();
    }
  })
);

router.post(
  '/books/:id',
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect('/books/');
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render(`books/update-book`, {
          book,
          errors: error.errors,
          title: 'Edit Book',
        });
      } else {
        throw error;
      }
    }
  })
);

/* Delete individual article. */
router.post(
  '/books/:id/delete',
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
      await book.destroy();
      res.render('/books');
    } else {
      res.sendStatus(404);
    }
  })
);

router.get(
  '/books/search',
  asyncHandler(async (req, res, next) => {
    const searchQuery = req.query.search;
    const searchResults = await Book.findAll({
      where: {
        [op.or]: [
          {
            title: {
              [op.like]: '%' + searchQuery + '%',
            },
          },
          {
            author: {
              [op.like]: '%' + searchQuery + '%',
            },
          },
          {
            genre: {
              [op.like]: '%' + searchQuery + '%',
            },
          },
          {
            year: searchQuery,
          },
        ],
      },
    });
    let title;
    if (searchResults.length < 1) {
      title = 'No Search Results, Try again.';
    } else {
      title = `Search Results (${searchResults.length})`;
    }
    res.render('books/index', { searchResults, title: title });
  })
);

//General Error Handling
router.get('/error', (req, res, next) => {
  const err = new Error();
  err.message = `Server Error`;
  err.status = 500;
  throw err;
});

router.use((req, res, next) => {
  next(createError(404));
});

router.use((err, req, res, next) => {
  res.locals.message = err.message;
  if (err.status === 404) {
    res.status(err.statusCode);
    err.message = 'Page Not Found';
    console.error('Page Not Found', err.status);
    res.render('page-not-found', { err });
  } else {
    res.status(err.statusCode || 500);
    console.error('Server Error', err.status);
    err.message = 'Server Error.';
    res.render('error', { err });
  }
});
module.exports = router;
