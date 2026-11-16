/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       required:
 *         - questionText
 *         - options
 *         - correctAnswer
 *       properties:
 *         questionText:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: string
 *         correctAnswer:
 *           type: string
 *         explanation:
 *           type: string
 *     Lecture:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         videoUrl:
 *           type: string
 *         fileUrl:
 *           type: string
 *         order:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Summary:
 *       type: object
 *       required:
 *         - title
 *         - fileUrl
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         fileUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Record:
 *       type: object
 *       required:
 *         - title
 *         - audioUrl
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         audioUrl:
 *           type: string
 *         duration:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Quiz:
 *       type: object
 *       required:
 *         - title
 *         - durationInMinutes
 *         - questions
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         durationInMinutes:
 *           type: number
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Subject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         code:
 *           type: string
 *         department:
 *           type: string
 *         thumbnail:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *         createdBy:
 *           type: object
 *         lectures:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lecture'
 *         summaries:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Summary'
 *         records:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Record'
 *         quizzes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Quiz'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for title, description, code, or department
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: List of subjects
 *   post:
 *     summary: Create a new subject (Admin & SuperAdmin only)
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *               department:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subject created successfully
 */
/**
 * @swagger
 * /subjects/{subjectId}:
 *   get:
 *     summary: Get subject by ID with lectures, summaries, records, and quizzes
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject details
 *       404:
 *         description: Subject not found
 *   put:
 *     summary: Update subject metadata (Admin & SuperAdmin only)
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject updated
 *   delete:
 *     summary: Delete a subject (Admin & SuperAdmin only)
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject deleted
 */
/**
 * @swagger
 * /subjects/{subjectId}/lectures:
 *   patch:
 *     summary: Add or remove a lecture from a subject (Admin & SuperAdmin only)
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *                 default: add
 *               lectureId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Lecture added or removed successfully
 */
/**
 * @swagger
 * /subjects/{subjectId}/summaries:
 *   patch:
 *     summary: Add or remove a study summary (Admin & SuperAdmin only)
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *                 default: add
 *               summaryId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Summary added or removed successfully
 */
/**
 * @swagger
 * /subjects/{subjectId}/records:
 *   patch:
 *     summary: Add or remove an audio record (Admin & SuperAdmin only)
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *                 default: add
 *               recordId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               duration:
 *                 type: string
 *     responses:
 *       200:
 *         description: Audio record added or removed successfully
 */
/**
 * @swagger
 * /subjects/{subjectId}/quizzes:
 *   patch:
 *     summary: Add or remove an interactive quiz (Admin & SuperAdmin only)
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *                 default: add
 *               quizId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               durationInMinutes:
 *                 type: number
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Question'
 *     responses:
 *       200:
 *         description: Quiz added or removed successfully
 */
export {};
//# sourceMappingURL=subjects.docs.js.map