-- CreateTable
CREATE TABLE "Place" (
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Cheapie" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cheapie_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cheapie" ADD CONSTRAINT "Cheapie_store_fkey" FOREIGN KEY ("store") REFERENCES "Place"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;
