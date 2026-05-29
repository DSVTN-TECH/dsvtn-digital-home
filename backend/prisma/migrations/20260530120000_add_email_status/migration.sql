CREATE TYPE "EmailStatus" AS ENUM ('NOT_CONFIGURED', 'SENT', 'FAILED');

ALTER TABLE "volunteer_applications"
ADD COLUMN "email_status" "EmailStatus" NOT NULL DEFAULT 'NOT_CONFIGURED';

ALTER TABLE "orders"
ADD COLUMN "email_status" "EmailStatus" NOT NULL DEFAULT 'NOT_CONFIGURED';
