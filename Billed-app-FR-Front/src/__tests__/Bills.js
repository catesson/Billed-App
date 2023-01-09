/**
 * @jest-environment jsdom
 */

import {
  screen,
  waitFor,
  getAllByTestId,
  getByTestId,
  getByText,
} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.className).toEqual("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("I click on add a new bill", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("btn-new-bill"));
      const btnNewBill = screen.getByTestId("btn-new-bill");
      expect(btnNewBill).toBeDefined();
      userEvent.click(btnNewBill);
      expect(window.location.hash).toEqual(ROUTES_PATH.NewBill);
    });
    test("I click on icon Eye ", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      //déclaration de bills
      document.body.innerHTML = BillsUI({ data: bills });

      const store = null;
      const newBills = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const iconEye = getAllByTestId(document.body, "icon-eye")[0];
      const handleClickIconEye = jest.fn(() =>
        newBills.handleClickIconEye(iconEye)
      );
      iconEye.addEventListener("click", handleClickIconEye);
      const noImgModal = document.querySelector(`img[alt="Bill"]`);
      //test que l'image n'est pas encore disponible
      expect(noImgModal).toBeFalsy();
      expect(handleClickIconEye).toHaveBeenCalledTimes(0);
      //clique sur iconEye
      userEvent.click(iconEye);
      const imgModal = document.querySelector(`img[alt="Bill"]`);
      //test que l'image est disponible
      expect(handleClickIconEye).toHaveBeenCalledTimes(1);
      expect(imgModal).toBeTruthy();
    });
  });
});
//test des erreur
describe("given I am a employee connected", () => {
  describe("When I am on Bills page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
      jest.spyOn(mockStore, "bills");
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
      await new Promise(process.nextTick);
      const message = await screen.getAllByTestId("error-message");
      expect(message).toEqual("test");
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getAllByTestId("error-message");
      expect(message).toEqual("test");
    });
  });
});
