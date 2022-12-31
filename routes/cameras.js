const { Router } = require("express")
const {
  add_camera,
  get_all_cameras,
  get_camera,
  update_camera,
  remove_camera,
} = require("../controllers/cameras.js")

const router = Router()

router.route("/").post(controller.add_camera).get(controller.get_all_cameras)

router
  .route("/:camera_id")
  .get(controller.get_camera)
  .delete(controller.remove_camera)
  .put(controller.update_camera)
  .patch(controller.update_camera)

router.route("/:camera_id/stream").get(controller.get_stream)

module.exports = router
