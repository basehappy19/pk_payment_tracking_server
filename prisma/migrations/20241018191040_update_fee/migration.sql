-- AddForeignKey
ALTER TABLE `Fees` ADD CONSTRAINT `Fees_education_year_id_fkey` FOREIGN KEY (`education_year_id`) REFERENCES `EducationYears`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fees` ADD CONSTRAINT `Fees_education_term_id_fkey` FOREIGN KEY (`education_term_id`) REFERENCES `EducationTerms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
