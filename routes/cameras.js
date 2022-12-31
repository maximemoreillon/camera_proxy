const { Router } = require("express")
const {
  add_camera,
  get_all_cameras,
  get_camera,
  update_camera,
  remove_camera,
} = require("../controllers/cameras.js")

const router = Router()

router.route("/").post(add_camera).get(get_all_cameras)

router
  .route("/:camera_id")
  .get(get_camera)
  .delete(remove_camera)
  .put(update_camera)
  .patch(update_camera)

router.route("/:camera_id/stream").get(get_stream)

module.exports = router
