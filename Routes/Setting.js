const express = require('express');
const router = express.Router();
const { AddEducationYear, AddEducationTerm, getEducationYears, getEducationTerms, EditEducationYear, RemoveEducationYear, EditEducationTerm, RemoveEducationTerm, } = require('../Controllers/Settings/Education');
const { AddLevel, getLevels, EditLevel, RemoveLevel } = require('../Controllers/Settings/Level');
const { AddRoom, getRooms, EditRoom, RemoveRoom } = require('../Controllers/Settings/Room');
const { VerifySchool } = require('../Middlewares/Verify');

router.get('/setting/education/years', VerifySchool, getEducationYears);
router.post('/setting/education/year', VerifySchool, AddEducationYear);
router.put('/setting/education/year', VerifySchool, EditEducationYear);
router.delete('/setting/education/year', VerifySchool, RemoveEducationYear);

router.get('/setting/education/terms', VerifySchool, getEducationTerms);
router.post('/setting/education/term', VerifySchool, AddEducationTerm);
router.put('/setting/education/term', VerifySchool, EditEducationTerm);
router.delete('/setting/education/term', VerifySchool, RemoveEducationTerm);

router.get('/setting/levels', VerifySchool, getLevels);
router.post('/setting/level', VerifySchool, AddLevel);
router.put('/setting/level', VerifySchool, EditLevel);
router.delete('/setting/level', VerifySchool, RemoveLevel);

router.get('/setting/rooms', VerifySchool, getRooms);
router.post('/setting/room', VerifySchool, AddRoom);
router.put('/setting/room', VerifySchool, EditRoom);
router.delete('/setting/room', VerifySchool, RemoveRoom);

module.exports = router;