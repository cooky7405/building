"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// 임시 데이터 - 실제 구현에서는 API에서 데이터를 가져옵니다
const noticeData = {
  id: "1",
  title: "화재 경보기 점검 안내",
  content:
    "안녕하세요, 입주자 여러분.\n\n다음 주 수요일(6월 5일)에 연례 화재 경보기 점검이 예정되어 있습니다. 모든 세대의 화재 경보기를 점검할 예정이며, 오전 10시부터 오후 4시까지 진행됩니다.\n\n점검 당일에는 각 세대에 방문하게 되므로 가능한 재택을 부탁드립니다. 부재 시에는 관리실에 미리 연락 주시기 바랍니다.\n\n협조해 주셔서 감사합니다.",
  author: "관리자",
  createdAt: "2023-05-25",
  priority: "high",
  requiresConfirmation: true,
  requiresCompletion: true,
  completionDeadline: "2023-06-10",
  confirmationRate: 80,
  completionRate: 50,
  userConfirmed: false,
  userCompleted: false,
};

export default function NoticePage({
  params,
}: {
  params: { id: string; noticeId: string };
}) {
  const [isUserConfirmed, setIsUserConfirmed] = useState(
    noticeData.userConfirmed
  );
  const [isUserCompleted, setIsUserCompleted] = useState(
    noticeData.userCompleted
  );
  const [confirmationRate, setConfirmationRate] = useState(
    noticeData.confirmationRate
  );
  const [completionRate, setCompletionRate] = useState(
    noticeData.completionRate
  );
  const router = useRouter();
  // const { toast } = useToast()

  const handleConfirmation = () => {
    if (!isUserConfirmed) {
      setIsUserConfirmed(true);
      setConfirmationRate((prev) => Math.min(100, prev + 5));

      toast("확인 완료", {
        description: "공지를 확인하셨습니다.",
      });
    }
  };

  const handleCompletion = () => {
    if (!isUserCompleted) {
      setIsUserCompleted(true);
      setCompletionRate((prev) => Math.min(100, prev + 10));

      toast("작업 완료", {
        description: "작업 완료가 기록되었습니다.",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low":
        return "낮음";
      case "normal":
        return "보통";
      case "high":
        return "높음";
      case "urgent":
        return "긴급";
      default:
        return "보통";
    }
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BellRing className="h-6 w-6" />
          <h1 className="text-3xl font-bold">공지사항 상세</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            뒤로가기
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                삭제
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>공지사항 삭제</DialogTitle>
                <DialogDescription>
                  이 공지사항을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수
                  없습니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">취소</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    toast("공지가 삭제되었습니다", {
                      description: "공지가 성공적으로 삭제되었습니다.",
                    });
                    router.back();
                  }}
                >
                  삭제
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex gap-2 items-center mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                    noticeData.priority
                  )}`}
                >
                  {getPriorityText(noticeData.priority)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {noticeData.createdAt}
                </span>
              </div>
              <CardTitle className="text-2xl">{noticeData.title}</CardTitle>
              <CardDescription>작성자: {noticeData.author}</CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line mb-6">{noticeData.content}</div>

          <Separator className="my-6" />

          <div className="space-y-4">
            {noticeData.requiresConfirmation && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">확인 현황</span>
                  </div>
                  <span className="text-sm">{confirmationRate}%</span>
                </div>
                <Progress value={confirmationRate} className="h-2" />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="confirmation"
                    checked={isUserConfirmed}
                    onCheckedChange={handleConfirmation}
                  />
                  <label
                    htmlFor="confirmation"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    이 공지를 확인했습니다
                  </label>
                </div>
              </div>
            )}

            {noticeData.requiresCompletion && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">작업 완료 현황</span>
                  </div>
                  <span className="text-sm">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
                <div className="flex items-center gap-x-2 mt-2">
                  <Checkbox
                    id="completion"
                    checked={isUserCompleted}
                    onCheckedChange={handleCompletion}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="completion"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      작업을 완료했습니다
                    </label>
                    {noticeData.completionDeadline && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        기한: {noticeData.completionDeadline}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            목록으로 돌아가기
          </Button>
          <Button
            onClick={() => router.push(`/buildings/${params.id}/notices`)}
          >
            다음 공지 보기
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
