/**
 * @jest-environment jsdom
 */

import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store";

import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    afterEach(() => {
      document.body.innerHTML = "";
    });
    test("The Form New Bill is defined", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeDefined();
      const datepicker = screen.getByTestId("datepicker");
      expect(datepicker).toBeDefined();
      const type = screen.getByTestId("expense-type");
      expect(type).toBeDefined();
      const name = screen.getByTestId("expense-name");
      expect(name).toBeDefined();
      const amount = screen.getByTestId("amount");
      expect(amount).toBeDefined();
      const vat = screen.getByTestId("vat");
      expect(vat).toBeDefined();
      const pct = screen.getByTestId("pct");
      expect(pct).toBeDefined();
      const commentary = screen.getByTestId("commentary");
      expect(commentary).toBeDefined();
      expect(screen.getByTestId("file")).toBeDefined();
    });
    
    test("click on submit button", async () => {
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
      window.onNavigate(ROUTES_PATH["NewBill"]);
      await waitFor(() => screen.getByText("Envoyer"));
      const submit = screen.getByText("Envoyer");

      await waitFor(() => screen.getByTestId("datepicker"));
      const date = screen.getByTestId("datepicker");
      userEvent.type(date, "12122022");
      await waitFor(() => screen.getByTestId("amount"));
      const amount = screen.getByTestId("amount");
      userEvent.type(amount, "300");
      await waitFor(() => screen.getByTestId("pct"));
      const pct = screen.getByTestId("pct");
      userEvent.type(pct, "300");
      const img = new File(["hello"], "hello.png", { type: "image/png" });
      const input = screen.getByTestId("file");
      userEvent.upload(input, img);
      userEvent.click(submit);
      expect(window.location.hash).toEqual(ROUTES_PATH.Bills);
    });
    
  });
});
