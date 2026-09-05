const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'dealflow360-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT Token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role, company, tier } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists in User or Customer table
    const [existingUser, existingCustomer] = await Promise.all([
      prisma.user.findUnique({ where: { email: cleanEmail } }),
      prisma.customer.findUnique({ where: { email: cleanEmail } }),
    ]);

    if (existingUser || existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'SALES_REP';

    if (userRole === 'CUSTOMER') {
      // Create Customer Account
      const newCustomer = await prisma.customer.create({
        data: {
          name,
          email: cleanEmail,
          password: hashedPassword,
          company: company || 'Acme Corp',
          tier: tier || 'Gold',
        },
      });

      const token = generateToken({
        id: newCustomer.id,
        email: newCustomer.email,
        name: newCustomer.name,
        role: 'CUSTOMER',
        company: newCustomer.company,
        tier: newCustomer.tier,
      });

      return res.status(201).json({
        success: true,
        message: 'Customer account created successfully.',
        token,
        user: {
          id: newCustomer.id,
          name: newCustomer.name,
          email: newCustomer.email,
          role: 'CUSTOMER',
          company: newCustomer.company,
          tier: newCustomer.tier,
        },
      });
    } else {
      // Create Staff / Admin User Account
      const newUser = await prisma.user.create({
        data: {
          name,
          email: cleanEmail,
          password: hashedPassword,
          role: userRole,
          company: company || 'DealFlow360 Internal',
        },
      });

      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        company: newUser.company,
      });

      return res.status(201).json({
        success: true,
        message: 'User account created successfully.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          company: newUser.company,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Search in Staff Users table
    let account = await prisma.user.findUnique({ where: { email: cleanEmail } });
    let isCustomer = false;

    // 2. If not found in Staff Users, search in Customers table
    if (!account) {
      account = await prisma.customer.findUnique({ where: { email: cleanEmail } });
      if (account) isCustomer = true;
    }

    // 3. Fallback for demo emails if DB password not yet set
    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Verify password with bcrypt
    const isPasswordValid = account.password
      ? await bcrypt.compare(password, account.password)
      : password === 'demo1234';

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 5. Generate JWT token
    const role = isCustomer ? 'CUSTOMER' : account.role || 'SALES_REP';
    const tokenPayload = {
      id: account.id,
      email: account.email,
      name: account.name,
      role,
      company: account.company,
      tier: account.tier || 'Gold',
    };

    const token = generateToken(tokenPayload);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: tokenPayload,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { id: userId } });
      if (!customer) {
        return res.status(440).json({ success: false, message: 'User session expired.' });
      }
      return res.json({
        success: true,
        user: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          role: 'CUSTOMER',
          company: customer.company,
          tier: customer.tier,
        },
      });
    } else {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(440).json({ success: false, message: 'User session expired.' });
      }
      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
