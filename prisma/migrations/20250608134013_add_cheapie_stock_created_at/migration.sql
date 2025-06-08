-- CreateEnum
CREATE TYPE "Stock" AS ENUM ('plenty', 'mid', 'low', 'gone');

-- AlterTable
ALTER TABLE "Cheapie" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stock" "Stock" NOT NULL DEFAULT 'low';
