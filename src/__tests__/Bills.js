/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
//import DashboardUI from "../views/DashboardUI.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toContain("active-icon");
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })


  // tester si on click sur le bouton "nouvelle note de frais" => page newBills
  describe("When I click on new-bill button", () => {
    test('Then, I should be sent to NewBill page', () => {
      //document.body.innerHTML = BillsUI({ data: [bills] })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const bill = new Bills({
        document, onNavigate, mockStore, localStorage: window.localStorage
      })

      const btnNewBill = screen.getByTestId("btn-new-bill")

      const handleClickNewBill = jest.fn((e) => {
        bill.handleClickNewBill(e)
      })
      btnNewBill.addEventListener("click", handleClickNewBill)
      userEvent.click(btnNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      const newBillPage = screen.getByTestId('form-new-bill')
      expect(newBillPage).toBeTruthy()
    })
  })

  // tester quand je click sur l'icon eye ça nous ouvre une modale
  describe("when i click on eye icon", () => {
    test("A modal should open", () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = BillsUI({ data: bills });
      $.fn.modal = jest.fn();

      const mockedBills = new Bills({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });

      const iconEye = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(mockedBills.handleClickIconEye(iconEye));

      iconEye.addEventListener("click", handleClickIconEye);
      userEvent.click(iconEye);

      expect(handleClickIconEye).toHaveBeenCalled;

      const modal = document.getElementById("modaleFile");
      expect(modal).toBeTruthy();

    })
  })



})


