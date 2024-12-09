// 模擬數據庫與狀態
let isLoggedIn = false;
let faceRecognitionHistory = []; // 儲存臉部辨識歷史紀錄

// 登入功能
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "411017276" && password === "1234") { // 模擬帳號密碼
    isLoggedIn = true;
    document.getElementById("login").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    alert("登入成功！");
    fetchNodeMCUData(); // 開始從 NodeMCU 獲取數據
  } else {
    alert("帳號或密碼錯誤！");
  }
}

// 從 NodeMCU 獲取數據
async function fetchNodeMCUData() {
  const nodeMCUUrl = "http://192.168.4.1/data"; // NodeMCU 提供數據的 API
  setInterval(async () => {
    try {
      const response = await fetch(nodeMCUUrl);
      if (!response.ok) throw new Error("無法從 NodeMCU 獲取數據");
      const data = await response.json();

      const temperature = data.temperature.toFixed(2); // 獲取溫度數據
      const humidity = data.humidity.toFixed(2); // 獲取濕度數據

      document.getElementById("temp").textContent = `即時溫度: ${temperature} °C`;
      document.getElementById("hum").textContent = `即時濕度: ${humidity} %`;

      // 更新圖表數據
      updateTempHumidityChart(temperature, humidity);
    } catch (error) {
      console.error("數據獲取錯誤：", error);
    }
  }, 2000); // 每 2秒獲取一次數據
}

// 上傳臉部辨識數據
function uploadFaceData() {
  const faceInput = document.getElementById("faceInput");
  if (faceInput.files.length === 0) {
    alert("請選擇一個圖像文件進行上傳！");
    return;
  }

  const file = faceInput.files[0];
  const timestamp = new Date().toLocaleString(); // 獲取當前時間

  // 模擬上傳成功
  setTimeout(() => {
    faceRecognitionHistory.push({ fileName: file.name, time: timestamp });
    alert("臉部資料上傳成功！");
    faceInput.value = ""; // 清空文件選擇
  }, 1000);
}

// 查看歷史紀錄
function viewHistory() {
  if (faceRecognitionHistory.length === 0) {
    alert("目前沒有任何歷史紀錄！");
    return;
  }

  // 切換到歷史紀錄頁面
  document.getElementById("mainContent").style.display = "none";
  document.getElementById("historyPage").style.display = "block";

  const historyList = document.getElementById("faceHistoryList");
  historyList.innerHTML = ""; // 清空之前的紀錄

  faceRecognitionHistory.forEach((record, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. 檔名：${record.fileName} - 上傳時間：${record.time}`;

    // 創建刪除按鈕
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "刪除";
    deleteButton.onclick = () => deleteHistory(index);

    // 將刪除按鈕加到列表項目中
    listItem.appendChild(deleteButton);
    historyList.appendChild(listItem);
  });
}

// 刪除歷史紀錄
function deleteHistory(index) {
  // 刪除對應索引的紀錄
  faceRecognitionHistory.splice(index, 1);

  // 更新歷史紀錄頁面
  viewHistory(); // 重新加載歷史紀錄
}

// 返回主頁面
function goBackToMain() {
  document.getElementById("historyPage").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
}

// LED 控制
async function toggleLED() {
  const nodeMCUUrl = "http://192.168.4.1/led"; // NodeMCU LED 控制的 API
  try {
    const response = await fetch(nodeMCUUrl, { method: "POST" });
    if (response.ok) {
      alert("LED 燈光已切換！");
    } else {
      alert("LED 控制失敗！");
    }
  } catch (error) {
    console.error("錯誤：", error);
  }
}

// 窗戶控制
async function toggleWindow() {
  const nodeMCUUrl = "http://192.168.4.1/window"; // NodeMCU 窗戶控制的 API
  try {
    const response = await fetch(nodeMCUUrl, { method: "POST" });
    if (response.ok) {
      alert("窗戶已切換開啟/關閉狀態！");
    } else {
      alert("窗戶控制失敗！");
    }
  } catch (error) {
    console.error("錯誤：", error);
  }
}

// 電風扇控制
async function toggleFan() {
  const nodeMCUUrl = "http://192.168.4.1/fan"; // NodeMCU 電風扇控制的 API
  try {
    const response = await fetch(nodeMCUUrl, { method: "POST" });
    if (response.ok) {
      alert("電風扇已切換開啟/關閉狀態！");
    } else {
      alert("電風扇控制失敗！");
    }
  } catch (error) {
    console.error("錯誤：", error);
  }
}

// RGB 燈光控制
async function setRGB(color) {
  const nodeMCUUrl = `http://192.168.4.1/rgb?color=${color}`; // NodeMCU RGB 控制的 API
  try {
    const response = await fetch(nodeMCUUrl, { method: "POST" });
    if (response.ok) {
      alert(`RGB 燈光已切換為 ${color}`);
    } else {
      alert("RGB 控制失敗！");
    }
  } catch (error) {
    console.error("錯誤：", error);
  }
}

// 初始化圖表
let tempHumidityChart;
function setupTempHumidityChart() {
  const ctx = document.getElementById("tempHumidityChart").getContext("2d");
  tempHumidityChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "溫度 (°C)",
          data: [],
          borderColor: "red",
          borderWidth: 2,
          fill: false,
        },
        {
          label: "濕度 (%)",
          data: [],
          borderColor: "blue",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true, // 啟用響應式
      maintainAspectRatio: false, // 保持畫面比例
      scales: {
        x: { title: { display: true, text: "時間" } },
        y: { title: { display: true, text: "數值" } },
      },
    },
  });
}

// 更新圖表數據
function updateTempHumidityChart(temp, hum) {
  const now = new Date().toLocaleTimeString();
  if (tempHumidityChart.data.labels.length > 10) {
    tempHumidityChart.data.labels.shift();
    tempHumidityChart.data.datasets[0].data.shift();
    tempHumidityChart.data.datasets[1].data.shift();
  }

  tempHumidityChart.data.labels.push(now);
  tempHumidityChart.data.datasets[0].data.push(temp);
  tempHumidityChart.data.datasets[1].data.push(hum);
  tempHumidityChart.update();
}

// 初始化圖表和頁面
window.onload = () => {
  setupTempHumidityChart();
};
