const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const user = await db.user.update({
    where: { email: 'farugn9@gmail.com' },
    data: { role: 'INSTRUCTOR' },
  });
  console.log('✅ تم التحديث! الدور الجديد:', user.role, '| البريد:', user.email);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
