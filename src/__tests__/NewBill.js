/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"
import mockStore from "../__mocks__/store"
import BillsUI from "../views/BillsUI.js"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");

      expect(mailIcon.className).toBe("active-icon");
    });
  });

  describe("When I am on NewBill Page and I select a image", () => {
    test("then the image is uploaded if the right extention is choose", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      document.body.innerHTML = NewBillUI()
      const uploadFile = screen.getByTestId("file")
      uploadFile.addEventListener("change", handleChangeFile)
      fireEvent.change(uploadFile, {
        target: { files: [new File(["image"], "image.png", { type: "image/png" })] },
      });
      console.log(uploadFile.files)
      expect(handleChangeFile).toHaveBeenCalled()

    })
  })

  describe("When i download the attached file in the wrong format", () => {
    test("Then i stay on the newbill and a message appears", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window, localStorage,
      })
      const LoadFile = jest.fn((e) => newBill.handleChangeFile(e))
      const fichier = screen.getByTestId("file")
      const testFormat = new File(["c'est un test"], "document.txt", {
        type: "document/txt"
      })
      fichier.addEventListener("change", LoadFile)
      fireEvent.change(fichier, { target: { files: [testFormat] } })

      expect(LoadFile).toHaveBeenCalled()
      expect(window.alert).toBeTruthy()
    })
  });

  //Post
  describe("When I create a new bill", () => {
    test("send bills to mock API POST", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      });

      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const buttonSendBill = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newBill.handleSubmit);
      buttonSendBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(buttonSendBill);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });


})
