import prisma from './src/config/database';
import bcrypt from 'bcryptjs';
import logger from './src/config/logger';

async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Clear existing data (optional - be careful in production!)
    if (process.env.NODE_ENV === 'development') {
      await prisma.notification.deleteMany();
      await prisma.auditLog.deleteMany();
      await prisma.statement.deleteMany();
      await prisma.transaction.deleteMany();
      await prisma.member.deleteMany();
      await prisma.user.deleteMany();
      logger.info('Cleared existing data');
    }

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@smsfintrack.co.ke',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    logger.info('Created admin user');

    // Create treasurer user
    const treasurerPassword = await bcrypt.hash('Treasurer123!', 10);
    const treasurerUser = await prisma.user.create({
      data: {
        email: 'treasurer@smsfintrack.co.ke',
        password: treasurerPassword,
        role: 'TREASURER',
      },
    });
    logger.info('Created treasurer user');

    // Create chairman user with member profile
    const chairmanPassword = await bcrypt.hash('Chairman123!', 10);
    const chairmanUser = await prisma.user.create({
      data: {
        email: 'chairman@smsfintrack.co.ke',
        password: chairmanPassword,
        role: 'CHAIRMAN',
        member: {
          create: {
            firstName: 'David',
            lastName: 'Mwangi',
            phoneNumber: '+254722000001',
            nationalId: '10000001',
            balance: 0,
          },
        },
      },
      include: { member: true },
    });
    logger.info('Created chairman user');

    // Create auditor user
    const auditorPassword = await bcrypt.hash('Auditor123!', 10);
    const auditorUser = await prisma.user.create({
      data: {
        email: 'auditor@smsfintrack.co.ke',
        password: auditorPassword,
        role: 'AUDITOR',
      },
    });
    logger.info('Created auditor user');

    // Create member users with profiles
    const memberUsers = [];
    if (chairmanUser.member) {
      memberUsers.push(chairmanUser);
    }

    const memberData = [
      { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe', phoneNumber: '+254722123456', nationalId: '12345678' },
      { email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith', phoneNumber: '+254722234567', nationalId: '23456789' },
      { email: 'peter.kamau@example.com', firstName: 'Peter', lastName: 'Kamau', phoneNumber: '+254722345678', nationalId: '34567890' },
      { email: 'grace.wanjiku@example.com', firstName: 'Grace', lastName: 'Wanjiku', phoneNumber: '+254722456789', nationalId: '45678901' },
      { email: 'james.ochieng@example.com', firstName: 'James', lastName: 'Ochieng', phoneNumber: '+254722567890', nationalId: '56789012' },
      { email: 'mercy.chebet@example.com', firstName: 'Mercy', lastName: 'Chebet', phoneNumber: '+254722678901', nationalId: '67890123' },
      { email: 'samuel.kipchumba@example.com', firstName: 'Samuel', lastName: 'Kipchumba', phoneNumber: '+254722789012', nationalId: '78901234' },
      { email: 'faith.nyambura@example.com', firstName: 'Faith', lastName: 'Nyambura', phoneNumber: '+254722890123', nationalId: '89012345' },
      { email: 'brian.omondi@example.com', firstName: 'Brian', lastName: 'Omondi', phoneNumber: '+254722901234', nationalId: '90123456' },
      { email: 'esther.akinyi@example.com', firstName: 'Esther', lastName: 'Akinyi', phoneNumber: '+254722012345', nationalId: '01234567' },
      { email: 'daniel.mutua@example.com', firstName: 'Daniel', lastName: 'Mutua', phoneNumber: '+254723111222', nationalId: '11223344' },
      { email: 'lucy.muthoni@example.com', firstName: 'Lucy', lastName: 'Muthoni', phoneNumber: '+254723222333', nationalId: '22334455' },
    ];

    const memberPassword = await bcrypt.hash('Member123!', 10);
    for (const data of memberData) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: memberPassword,
          role: 'MEMBER',
          member: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              phoneNumber: data.phoneNumber,
              nationalId: data.nationalId,
              balance: 0,
            },
          },
        },
        include: { member: true },
      });
      memberUsers.push(user);
      logger.info(`Created member user: ${data.email}`);
    }

    // Realistic transaction templates across multiple months and banks
    const transactionSets = [
      // January 2024
      { type: 'DEPOSIT', amount: 15000, bank: 'MPESA', desc: 'M-PESA deposit from savings', ref: 'RKH', month: 0, day: 5 },
      { type: 'DEPOSIT', amount: 8000, bank: 'EQUITY', desc: 'Equity salary credit', ref: 'EQ', month: 0, day: 10 },
      { type: 'WITHDRAWAL', amount: 3000, bank: 'MPESA', desc: 'M-PESA withdrawal', ref: 'RKW', month: 0, day: 14 },
      { type: 'DEPOSIT', amount: 5000, bank: 'KCB', desc: 'KCB standing order deposit', ref: 'KCB', month: 0, day: 20 },
      { type: 'WITHDRAWAL', amount: 2000, bank: 'MPESA', desc: 'M-PESA bill payment', ref: 'RKB', month: 0, day: 25 },
      // February 2024
      { type: 'DEPOSIT', amount: 12000, bank: 'MPESA', desc: 'M-PESA contribution deposit', ref: 'RKC', month: 1, day: 3 },
      { type: 'DEPOSIT', amount: 20000, bank: 'EQUITY', desc: 'Equity Bank deposit', ref: 'EQD', month: 1, day: 8 },
      { type: 'WITHDRAWAL', amount: 5000, bank: 'KCB', desc: 'KCB emergency withdrawal', ref: 'KCW', month: 1, day: 15 },
      { type: 'FEE', amount: 500, bank: 'MPESA', desc: 'Transaction fee', ref: 'FEE', month: 1, day: 18 },
      { type: 'DEPOSIT', amount: 7000, bank: 'COOP', desc: 'Co-op Bank deposit', ref: 'COP', month: 1, day: 22 },
      // March 2024
      { type: 'DEPOSIT', amount: 25000, bank: 'EQUITY', desc: 'Equity salary credit', ref: 'EQS', month: 2, day: 1 },
      { type: 'WITHDRAWAL', amount: 10000, bank: 'MPESA', desc: 'M-PESA cash withdrawal', ref: 'RKM', month: 2, day: 7 },
      { type: 'DEPOSIT', amount: 6000, bank: 'KCB', desc: 'KCB transfer received', ref: 'KCT', month: 2, day: 12 },
      { type: 'DEPOSIT', amount: 3000, bank: 'MPESA', desc: 'M-PESA received from member', ref: 'RKR', month: 2, day: 18 },
      { type: 'WITHDRAWAL', amount: 4000, bank: 'COOP', desc: 'Co-op Bank withdrawal', ref: 'COW', month: 2, day: 25 },
      // April 2024
      { type: 'DEPOSIT', amount: 18000, bank: 'MPESA', desc: 'M-PESA monthly contribution', ref: 'RKD', month: 3, day: 2 },
      { type: 'WITHDRAWAL', amount: 8000, bank: 'EQUITY', desc: 'Equity Bank withdrawal', ref: 'EQW', month: 3, day: 10 },
      { type: 'DEPOSIT', amount: 10000, bank: 'KCB', desc: 'KCB salary credit', ref: 'KCS', month: 3, day: 15 },
      { type: 'FEE', amount: 750, bank: 'EQUITY', desc: 'Account maintenance fee', ref: 'EQF', month: 3, day: 20 },
      { type: 'DEPOSIT', amount: 4500, bank: 'COOP', desc: 'Co-op Bank interest credit', ref: 'COI', month: 3, day: 28 },
      // May 2024
      { type: 'DEPOSIT', amount: 30000, bank: 'EQUITY', desc: 'Equity bonus credit', ref: 'EQB', month: 4, day: 5 },
      { type: 'WITHDRAWAL', amount: 12000, bank: 'MPESA', desc: 'M-PESA rent payment', ref: 'RKP', month: 4, day: 10 },
      { type: 'DEPOSIT', amount: 9000, bank: 'MPESA', desc: 'M-PESA business receipt', ref: 'RKE', month: 4, day: 15 },
      { type: 'WITHDRAWAL', amount: 6000, bank: 'KCB', desc: 'KCB transfer out', ref: 'KCO', month: 4, day: 22 },
      // June 2024
      { type: 'DEPOSIT', amount: 22000, bank: 'EQUITY', desc: 'Equity salary credit', ref: 'EQ6', month: 5, day: 1 },
      { type: 'DEPOSIT', amount: 5000, bank: 'COOP', desc: 'Co-op Bank dividend', ref: 'CO6', month: 5, day: 8 },
      { type: 'WITHDRAWAL', amount: 15000, bank: 'MPESA', desc: 'M-PESA school fees', ref: 'RK6', month: 5, day: 14 },
      { type: 'DEPOSIT', amount: 8000, bank: 'KCB', desc: 'KCB loan disbursement', ref: 'KC6', month: 5, day: 20 },
    ];

    for (const memberUser of memberUsers) {
      if (!memberUser.member) continue;

      let balance = 0;
      // Vary the amounts slightly per member for realism
      const memberIndex = memberUsers.indexOf(memberUser);
      const amountMultiplier = 0.7 + (memberIndex * 0.05);

      for (let i = 0; i < transactionSets.length; i++) {
        const txn = transactionSets[i];
        const adjustedAmount = Math.round(txn.amount * amountMultiplier);

        if (txn.type === 'DEPOSIT') {
          balance += adjustedAmount;
        } else {
          balance = Math.max(0, balance - adjustedAmount);
        }

        await prisma.transaction.create({
          data: {
            memberId: memberUser.member.id,
            type: txn.type as any,
            amount: adjustedAmount,
            balance,
            description: txn.desc,
            bankProvider: txn.bank as any,
            reference: `${txn.ref}${String(i).padStart(3, '0')}-${memberUser.member.id.substring(0, 8)}`,
            smsContent: `Sample SMS: ${txn.desc} KES ${adjustedAmount.toLocaleString()}`,
            transactionDate: new Date(2024, txn.month, txn.day),
          },
        });
      }

      // Update member balance
      await prisma.member.update({
        where: { id: memberUser.member.id },
        data: { balance },
      });

      logger.info(`Created ${transactionSets.length} transactions for member: ${memberUser.email}`);
    }

    // Create sample notifications for all users
    const allUsers = await prisma.user.findMany();
    for (const user of allUsers) {
      await prisma.notification.createMany({
        data: [
          {
            userId: user.id,
            title: 'Welcome to SMS-FinTrack',
            message: 'Your account has been set up successfully. Start tracking your Sacco finances!',
            type: 'INFO',
          },
          {
            userId: user.id,
            title: 'Monthly Statement Available',
            message: 'Your January 2024 statement is ready to view.',
            type: 'STATEMENT',
            link: '/statements',
          },
          {
            userId: user.id,
            title: 'New Transaction Detected',
            message: 'A deposit of KES 15,000 was processed from M-PESA.',
            type: 'TRANSACTION',
            link: '/transactions',
          },
          {
            userId: user.id,
            title: 'Sacco Meeting Reminder',
            message: 'Monthly Sacco meeting scheduled for the last Saturday of this month.',
            type: 'INFO',
          },
          {
            userId: user.id,
            title: 'Low Balance Alert',
            message: 'Your account balance has dropped below KES 5,000. Consider making a deposit.',
            type: 'WARNING',
          },
        ],
      });
    }
    logger.info('Created sample notifications for all users');

    logger.info('Database seeding completed successfully!');
    logger.info('\nTest Credentials:');
    logger.info('Admin:     admin@smsfintrack.co.ke / Admin123!');
    logger.info('Treasurer: treasurer@smsfintrack.co.ke / Treasurer123!');
    logger.info('Chairman:  chairman@smsfintrack.co.ke / Chairman123!');
    logger.info('Auditor:   auditor@smsfintrack.co.ke / Auditor123!');
    logger.info('Member:    john.doe@example.com / Member123!');
    logger.info(`Total members: ${memberUsers.length}`);
    logger.info(`Total transactions: ${memberUsers.length * transactionSets.length}`);
  } catch (error) {
    logger.error('Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
