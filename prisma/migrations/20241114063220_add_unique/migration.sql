/*
  Warnings:

  - A unique constraint covering the columns `[education_year_id,education_term_id,level_id,room_id]` on the table `Classrooms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `EducationTerms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `EducationYears` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,education_year_id,education_term_id]` on the table `Fees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Levels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ReceiptBooks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Rooms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_in_classroom_id,receipt_book_id,receipt_no]` on the table `StudentReceipt` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cid]` on the table `Students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Classrooms_education_year_id_education_term_id_level_id_room_key` ON `Classrooms`(`education_year_id`, `education_term_id`, `level_id`, `room_id`);

-- CreateIndex
CREATE UNIQUE INDEX `EducationTerms_name_key` ON `EducationTerms`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `EducationYears_name_key` ON `EducationYears`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Fees_name_education_year_id_education_term_id_key` ON `Fees`(`name`, `education_year_id`, `education_term_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Levels_name_key` ON `Levels`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `ReceiptBooks_name_key` ON `ReceiptBooks`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Roles_name_key` ON `Roles`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Rooms_name_key` ON `Rooms`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `StudentReceipt_student_in_classroom_id_receipt_book_id_recei_key` ON `StudentReceipt`(`student_in_classroom_id`, `receipt_book_id`, `receipt_no`);

-- CreateIndex
CREATE UNIQUE INDEX `Students_cid_key` ON `Students`(`cid`);

-- CreateIndex
CREATE UNIQUE INDEX `Users_username_key` ON `Users`(`username`);
