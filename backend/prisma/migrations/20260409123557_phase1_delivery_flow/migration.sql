-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryType" TEXT NOT NULL DEFAULT 'IN_STORE',
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT;
