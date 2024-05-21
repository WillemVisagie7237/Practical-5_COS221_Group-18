const express = require('express');
const session = require('express-session');
const mariadb = require('mariadb');
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcrypt');

const app = express();
const port = 3007;

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10
});

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login.html');
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get('/Main.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Main.html'));
});

app.get('/manage.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'manage.html'));
});

app.get('/contentDisplay.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contentDisplay.html'));
});

app.use(express.static(path.join(__dirname, 'views')));

const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (err) {
    console.error('Error getting database connection:', err);
    throw err;
  }
};

app.get('/', (req, res) => {
  res.redirect('/register.html');
});

app.post('/register', async (req, res) => {
  const { username, password, Re_enter_password} = req.body;

  if (password != Re_enter_password){
    console.error('Password is not the same');
    res.redirect('/register.html?error=password_mismatch');
    return;
  }

  let conn;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    conn = await getConnection();
    const result = await conn.query('INSERT INTO user (username, password) VALUES (?, ?)', [username, hashedPassword]);
    if (result.affectedRows > 0) {
      req.session.user = { username };
      res.redirect('/Main.html');
    } else {
      res.redirect('/register.html?error=invalid_credentials');
    }
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  let conn;
  try {
    conn = await getConnection();
    const user = await conn.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password]);
    if (user.length > 0) {
      req.session.user = user[0];
      res.redirect('/Main.html');
    } else {
      res.redirect('/login.html?error=invalid_credentials');
    }
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

app.post('/content', isAuthenticated, async (req, res) => {
  const { id, title, description, releaseYear, rating, genre, runtime, type } = req.body;

  let conn;
  try {
    conn = await getConnection();
    if (id) {
      await conn.query('UPDATE content SET title = ?, description = ?, release_year = ?, rating = ?, genre = ? WHERE id = ?', [title, description, releaseYear, rating, genre, id]);
      if (type === 'movie') {
        await conn.query('UPDATE movie SET runtime = ? WHERE content_id = ?', [runtime, id]);
      } else if (type === 'series') {
        await conn.query('UPDATE series SET seasons = ? WHERE content_id = ?', [runtime, id]);
      }
    } else {
      const result = await conn.query('INSERT INTO content (title, description, release_year, rating, genre) VALUES (?, ?, ?, ?, ?)', [title, description, releaseYear, rating, genre]);
      const contentId = result.insertId;
      if (type === 'movie') {
        await conn.query('INSERT INTO movie (content_id, runtime) VALUES (?, ?)', [contentId, runtime]);
      } else if (type === 'series') {
        await conn.query('INSERT INTO series (content_id, seasons) VALUES (?, ?)', [contentId, runtime]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/content/delete', isAuthenticated, async (req, res) => {
  const { id, type } = req.body;

  let conn;
  try {
    conn = await getConnection();
    if (type === 'movie') {
      await conn.query('DELETE FROM movie WHERE content_id = ?', [id]);
    } else if (type === 'series') {
      await conn.query('DELETE FROM series WHERE content_id = ?', [id]);
    }
    await conn.query('DELETE FROM content WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/persons', isAuthenticated, async (req, res) => {
  const { firstName, lastName, dob, role } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.query('INSERT INTO person (first_name, last_name, date_of_birth, role) VALUES (?, ?, ?, ?)', [firstName, lastName, dob, role]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error adding actor:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

// Server-side code

// POST endpoint to add a genre to a content piece
app.post('/content/genre/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { genre } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.query('UPDATE content SET genre = ? WHERE id = ?', [genre, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error adding genre to content:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE endpoint to remove a genre from a content piece
app.delete('/content/genre/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  let conn;
  try {
    conn = await getConnection();
    await conn.query('UPDATE content SET genre = NULL WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing genre from content:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT endpoint to update the genre of a content piece
app.put('/content/genre/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { genre } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.query('UPDATE content SET genre = ? WHERE id = ?', [genre, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating genre for content:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});


app.post('/studios', isAuthenticated, async (req, res) => {
  const { studioName, studioCountry, foundingYear, ceo, website } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.query('INSERT INTO production_studio (name, country, founding_year, ceo, website) VALUES (?, ?, ?, ?, ?)', [studioName, studioCountry, foundingYear, ceo, website]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error adding production studio:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

// PUT endpoint to update a production studio
app.put('/studios/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { studioName, studioCountry, foundingYear, ceo, website } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.query('UPDATE production_studio SET name = ?, country = ?, founding_year = ?, ceo = ?, website = ? WHERE id = ?', [studioName, studioCountry, foundingYear, ceo, website, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating production studio:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

// DELETE endpoint to delete a production studio
app.delete('/studios/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  let conn;
  try {
    conn = await getConnection();
    await conn.query('DELETE FROM production_studio WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting production studio:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});







app.put('/persons/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { role, firstName, lastName, dob } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.query('UPDATE person SET role = ?, first_name = ?, last_name = ?, date_of_birth = ? WHERE person_id = ?', [role, firstName, lastName, dob, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating person:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

app.delete('/persons/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  let conn;
  try {
    conn = await getConnection();
    await conn.query('DELETE FROM person WHERE person_id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting person:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

app.get('/content', isAuthenticated, async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const content = await conn.query('SELECT * FROM content');
    res.json(content);
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});


app.get('/content/genres', isAuthenticated, async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const genres = await conn.query('SELECT DISTINCT genre FROM content');
    const genreList = genres.map(genre => genre.genre);
    res.json(genreList);
  } catch (err) {
    console.error('Error fetching genres:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

// GET endpoint to fetch production studios
app.get('/content/studios', isAuthenticated, async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const studios = await conn.query('SELECT * FROM production_studio');
    res.json(studios);
  } catch (err) {
    console.error('Error fetching production studios:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

app.get('/filtered-content', isAuthenticated, async (req, res) => {
  let { minReleaseYear, maxReleaseYear, minRating, maxRating, sortBy, genre, studio } = req.query;

  // Parse filter parameters to ensure they are numeric
  minReleaseYear = parseFloat(minReleaseYear);
  maxReleaseYear = parseFloat(maxReleaseYear);
  minRating = parseFloat(minRating);
  maxRating = parseFloat(maxRating);

  // Construct the SQL query dynamically based on the filter parameters
  let sql = 'SELECT c.*, ps.name AS studio_name FROM content c LEFT JOIN production_studio ps ON c.production_studio_id = ps.id WHERE 1=1';
  const params = [];

  if (!isNaN(minReleaseYear)) {
    sql += ' AND c.release_year >= ?';
    params.push(minReleaseYear);
  }
  if (!isNaN(maxReleaseYear)) {
    sql += ' AND c.release_year <= ?';
    params.push(maxReleaseYear);
  }
  if (!isNaN(minRating)) {
    sql += ' AND c.rating >= ?';
    params.push(minRating);
  }
  if (!isNaN(maxRating)) {
    sql += ' AND c.rating <= ?';
    params.push(maxRating);
  }

  if (genre && genre !== '(no genres listed)') {
    sql += ' AND c.genre = ?';
    params.push(genre);
  }

  if (studio && studio !== '(no production studio listed)') {
    // Retrieve the production studio ID based on its name
    const studioIdQuery = 'SELECT id FROM production_studio WHERE name = ?';
    const studioIdResult = await conn.query(studioIdQuery, [studio]);
    
    // Check if the studio name is valid
    if (studioIdResult.length > 0) {
        const studioId = studioIdResult[0].id;
        sql += ' AND production_studio_id = ?';
        params.push(studioId);
    } else {
        // Handle the case when the studio name is not found
        console.error('Production studio not found:', studio);
        res.status(400).json({ error: 'Production studio not found' });
        return;
    }
}

  // Ensure that sortBy is valid to prevent SQL injection
  const validSortBy = ['title', 'release_year', 'rating']; // Valid columns for sorting
  if (validSortBy.includes(sortBy)) {
    sql += ` ORDER BY ${sortBy}`;
  } else {
    // Default sorting column if sortBy is invalid
    sql += ' ORDER BY c.title';
  }

  let conn;
  try {
    conn = await getConnection();
    const content = await conn.query(sql, params);
    res.json(content);
  } catch (err) {
    console.error('Error fetching filtered content:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});





app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
