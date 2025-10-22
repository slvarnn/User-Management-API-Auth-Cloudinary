import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const userId = req.user.id;
    const uploadStream = (buffer) => {
      return new Promise((resolve, reject) => {
        
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars', public_id: `user-${userId}-avatar` },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await uploadStream(req.file.buffer);
    const updateQuery = 'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING avatar_url, updated_at';
    const { rows: updatedRows } = await pool.query(updateQuery, [result.secure_url, userId]);
    res.json({
      message: 'Avatar uploaded successfully',
      url: updatedRows[0].avatar_url,
      updated_at: updatedRows[0].updated_at
    });

  } catch (err) {
    console.error('Error uploading avatar:', err.message);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Forbidden: You can only view your own profile or you are not an admin' });
 
    const query = 'SELECT id, username, email, role, avatar_url, created_at, updated_at FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user by ID:', err.message);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Forbidden: You can only update your own profile or you are not an admin' });

    let updateFields = [];
    let queryParams = [];
    let paramIndex = 1;
    if (username) {
      updateFields.push(`username = $${paramIndex++}`);
      queryParams.push(username);
    }

    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ message: 'Invalid email format' });
    
      const existingEmail = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (existingEmail.rows.length > 0)
        return res.status(409).json({ message: 'Email already in use by another user.' });

      updateFields.push(`email = $${paramIndex++}`);
      queryParams.push(email);
    }

    if (password) {
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password))
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.' });
      const hashed = await bcrypt.hash(password, 10);
      updateFields.push(`password = $${paramIndex++}`);
      queryParams.push(hashed);
    }

    if (role && req.user.role === 'admin') {
        updateFields.push(`role = $${paramIndex++}`);
        queryParams.push(role);
    } else if (role && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Forbidden: Only admins can change user roles' });

    updateFields.push(`updated_at = NOW()`);
    if (updateFields.length === 0)
      return res.status(400).json({ message: 'No fields to update' });

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++}
      RETURNING id, username, email, role, avatar_url, updated_at`;

    queryParams.push(id);

    const { rows } = await pool.query(query, queryParams);
    if (!rows.length)
      return res.status(404).json({ message: 'User not found or nothing updated' });


    res.json({ message: 'User updated successfully', user: rows[0] });
  } catch (err) {
    console.error('Error updating user:', err.message);
    if (err.code === '23505') {
        return res.status(409).json({ message: 'Username or email already in use', error: err.message });
    }
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own profile or you are not an admin' });
    }

    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', userId: rows[0].id });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};